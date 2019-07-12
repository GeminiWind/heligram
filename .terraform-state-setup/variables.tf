variable "aws_region" {
  description = "AWS region to launch servers."
  default     = "ap-southeast-2"
}

variable "stage" {
  description = "Stage where app should be deployed like dev, staging or prod."
  default     = "dev"
}