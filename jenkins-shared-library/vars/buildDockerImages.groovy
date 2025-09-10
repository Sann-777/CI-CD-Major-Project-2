#!/usr/bin/env groovy

/**
 * Jenkins Shared Library: Build and Tag Docker Images
 * 
 * This function builds Docker images for all StudyNotion microservices
 * and tags them with the format: asxhazard/studynotion-{servicename}:{tag}
 * 
 * Usage:
 *   buildDockerImages(tag: 'latest')
 *   buildDockerImages(tag: env.BUILD_NUMBER)
 *   buildDockerImages(tag: 'v1.0.0', registry: 'asxhazard')
 */

def call(Map config = [:]) {
    // Default configuration
    def defaultConfig = [
        tag: 'latest',
        registry: 'asxhazard',
        parallel: true,
        cleanup: true
    ]
    
    // Merge user config with defaults
    config = defaultConfig + config
    
    // Define all services with their build contexts
    def services = [
        'api-gateway': [
            dockerfile: 'microservices/api-gateway/Dockerfile',
            context: 'microservices/api-gateway',
            port: '3000'
        ],
        'auth-service': [
            dockerfile: 'microservices/auth-service/Dockerfile', 
            context: 'microservices/auth-service',
            port: '3001'
        ],
        'course-service': [
            dockerfile: 'microservices/course-service/Dockerfile',
            context: 'microservices/course-service', 
            port: '3003'
        ],
        'profile-service': [
            dockerfile: 'microservices/profile-service/Dockerfile',
            context: 'microservices/profile-service',
            port: '3004'
        ],
        'rating-service': [
            dockerfile: 'microservices/rating-service/Dockerfile',
            context: 'microservices/rating-service',
            port: '3005'
        ],
        'media-service': [
            dockerfile: 'microservices/media-service/Dockerfile',
            context: 'microservices/media-service',
            port: '3006'
        ],
        'notification-service': [
            dockerfile: 'microservices/notification-service/Dockerfile',
            context: 'microservices/notification-service',
            port: '3007'
        ],
        'frontend': [
            dockerfile: 'frontend-microservice/Dockerfile',
            context: 'frontend-microservice',
            port: '3008'
        ]
    ]
    
    echo "🚀 Starting Docker image build process..."
    echo "Registry: ${config.registry}"
    echo "Tag: ${config.tag}"
    echo "Services: ${services.keySet().join(', ')}"
    
    def buildResults = [:]
    
    if (config.parallel) {
        // Build images in parallel for faster execution
        def parallelBuilds = [:]
        
        services.each { serviceName, serviceConfig ->
            parallelBuilds[serviceName] = {
                buildSingleImage(serviceName, serviceConfig, config, buildResults)
            }
        }
        
        echo "🔄 Building ${services.size()} images in parallel..."
        parallel parallelBuilds
        
    } else {
        // Build images sequentially
        echo "🔄 Building ${services.size()} images sequentially..."
        services.each { serviceName, serviceConfig ->
            buildSingleImage(serviceName, serviceConfig, config, buildResults)
        }
    }
    
    // Summary report
    echo "\n📊 Build Summary:"
    echo "=================="
    buildResults.each { service, result ->
        def status = result.success ? "✅ SUCCESS" : "❌ FAILED"
        def duration = result.duration ? "(${result.duration}s)" : ""
        echo "${status} ${service} ${duration}"
        if (!result.success && result.error) {
            echo "   Error: ${result.error}"
        }
    }
    
    def successCount = buildResults.count { k, v -> v.success }
    def totalCount = buildResults.size()
    
    echo "\n🎯 Results: ${successCount}/${totalCount} images built successfully"
    
    if (config.cleanup) {
        echo "🧹 Cleaning up dangling images..."
        sh 'docker image prune -f || true'
    }
    
    // Fail the build if any image failed to build
    if (successCount != totalCount) {
        def failedServices = buildResults.findAll { k, v -> !v.success }.keySet()
        error("❌ Failed to build images for: ${failedServices.join(', ')}")
    }
    
    echo "🎉 All Docker images built and tagged successfully!"
    return buildResults
}

def buildSingleImage(serviceName, serviceConfig, config, buildResults) {
    def imageName = "${config.registry}/studynotion-${serviceName}"
    def fullImageTag = "${imageName}:${config.tag}"
    def startTime = System.currentTimeMillis()
    
    try {
        echo "🔨 Building ${serviceName}..."
        
        // Verify Dockerfile exists
        if (!fileExists(serviceConfig.dockerfile)) {
            throw new Exception("Dockerfile not found: ${serviceConfig.dockerfile}")
        }
        
        // Build the Docker image
        def buildCmd = """
            docker build \\
                -f ${serviceConfig.dockerfile} \\
                -t ${fullImageTag} \\
                --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') \\
                --build-arg VCS_REF=\${GIT_COMMIT:-unknown} \\
                --build-arg BUILD_NUMBER=\${BUILD_NUMBER:-0} \\
                --label org.opencontainers.image.created=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') \\
                --label org.opencontainers.image.revision=\${GIT_COMMIT:-unknown} \\
                --label org.opencontainers.image.version=${config.tag} \\
                --label org.opencontainers.image.source=\${GIT_URL:-unknown} \\
                --label studynotion.service.name=${serviceName} \\
                --label studynotion.service.port=${serviceConfig.port} \\
                ${serviceConfig.context}
        """
        
        sh buildCmd
        
        // Tag with additional tags if needed
        if (config.tag != 'latest') {
            sh "docker tag ${fullImageTag} ${imageName}:latest"
            echo "📌 Tagged ${serviceName} as latest"
        }
        
        // Add git commit tag if available
        if (env.GIT_COMMIT) {
            def shortCommit = env.GIT_COMMIT.take(8)
            sh "docker tag ${fullImageTag} ${imageName}:${shortCommit}"
            echo "📌 Tagged ${serviceName} with commit ${shortCommit}"
        }
        
        def duration = (System.currentTimeMillis() - startTime) / 1000
        buildResults[serviceName] = [
            success: true,
            imageName: fullImageTag,
            duration: duration
        ]
        
        echo "✅ Successfully built ${serviceName} (${duration}s)"
        
    } catch (Exception e) {
        def duration = (System.currentTimeMillis() - startTime) / 1000
        buildResults[serviceName] = [
            success: false,
            error: e.getMessage(),
            duration: duration
        ]
        
        echo "❌ Failed to build ${serviceName}: ${e.getMessage()}"
        
        // Continue with other builds in parallel mode
        if (!config.parallel) {
            throw e
        }
    }
}
