module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.1.5"

  name               = "StudyNotion-EKS"
  kubernetes_version = "1.33"

  compute_config = {
    enabled    = true
    node_pools = ["general-purpose"]
  }

  vpc_id     = "vpc-1234556abcdef"
  subnet_ids = ["subnet-abcde012", "subnet-bcde012a", "subnet-fghi345a"]

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}