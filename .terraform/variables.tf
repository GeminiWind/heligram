variable "aws_region" {
  description = "AWS region to launch servers."
  default     = "ap-southeast-2"
}

variable "stage" {
  description = "Stage where app should be deployed like dev, staging or prod."
  default = "dev"
}

variable "public_key_name" {
  description = "SSH Key name to connect your EC2."
}

variable "commit_sha" {
  description = "The current commit "
}