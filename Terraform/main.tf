# Data sources for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC for EKS cluster
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "studynotion-vpc"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    Environment = var.environment
    Terraform   = "true"
  }

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = var.cluster_name
  cluster_version = var.kubernetes_version

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  # EKS Managed Node Groups
  eks_managed_node_groups = {
    general = {
      name = "general-purpose"
      
      instance_types = ["t3.medium"]
      
      min_size     = 2
      max_size     = 6
      desired_size = 3

      disk_size = 50
      
      labels = {
        role = "general"
      }

      tags = {
        Environment = var.environment
        NodeGroup = "general-purpose"
      }
    }

    compute = {
      name = "compute-optimized"
      
      instance_types = ["c5.large"]
      
      min_size     = 1
      max_size     = 4
      desired_size = 2

      disk_size = 50
      
      labels = {
        role = "compute"
      }

      tags = {
        Environment = var.environment
        NodeGroup = "compute-optimized"
      }
    }
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Project     = "StudyNotion"
  }
}

# Security group for jump server
resource "aws_security_group" "jump_server_sg" {
  name_prefix = "studynotion-jump-server"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "studynotion-jump-server-sg"
    Environment = var.environment
  }
}

# Jump Server EC2 Instance
resource "aws_instance" "jump_server" {
  ami           = var.jump_server_ami
  instance_type = var.jump_server_instance_type
  key_name      = var.key_pair_name
  
  subnet_id                   = module.vpc.public_subnets[0]
  vpc_security_group_ids      = [aws_security_group.jump_server_sg.id]
  associate_public_ip_address = true

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    cluster_name = var.cluster_name
    region       = var.region
  }))

  tags = {
    Name = "studynotion-jump-server"
    Environment = var.environment
    Purpose = "EKS-Management"
  }
}

# IAM role for jump server to access EKS
resource "aws_iam_role" "jump_server_role" {
  name = "studynotion-jump-server-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "jump_server_eks_policy" {
  role       = aws_iam_role.jump_server_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_instance_profile" "jump_server_profile" {
  name = "studynotion-jump-server-profile"
  role = aws_iam_role.jump_server_role.name
}