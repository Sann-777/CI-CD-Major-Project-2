#!/bin/bash

# Update system
yum update -y

# Install required packages
yum install -y curl wget unzip git

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install kubectl
curl -o kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.28.3/2023-11-14/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin

# Install helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Configure kubectl for EKS cluster
aws eks update-kubeconfig --region ${region} --name ${cluster_name}

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install k9s for cluster management
wget https://github.com/derailed/k9s/releases/latest/download/k9s_Linux_amd64.tar.gz
tar -xzf k9s_Linux_amd64.tar.gz
sudo mv k9s /usr/local/bin/

# Create useful aliases
echo 'alias k=kubectl' >> /home/ec2-user/.bashrc
echo 'alias kgp="kubectl get pods"' >> /home/ec2-user/.bashrc
echo 'alias kgs="kubectl get services"' >> /home/ec2-user/.bashrc
echo 'alias kgd="kubectl get deployments"' >> /home/ec2-user/.bashrc

# Set up completion
echo 'source <(kubectl completion bash)' >> /home/ec2-user/.bashrc
echo 'complete -F __start_kubectl k' >> /home/ec2-user/.bashrc

# Create welcome message
cat > /etc/motd << 'EOF'
=======================================================
    StudyNotion EKS Jump Server
=======================================================
This server provides access to the StudyNotion EKS cluster.

Available tools:
- kubectl (k) - Kubernetes CLI
- aws - AWS CLI v2
- helm - Kubernetes package manager
- k9s - Terminal UI for Kubernetes
- docker - Container runtime

Useful commands:
- kubectl get nodes
- kubectl get pods -A
- k9s (interactive cluster management)

Cluster: ${cluster_name}
Region: ${region}
=======================================================
EOF

# Install nginx ingress controller prerequisites
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
