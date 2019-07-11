variable "aws_region" {
  description = "AWS region to launch servers."
  default     = "ap-southeast-2"
}

variable "public_key_name" {
  description = "SSH Key name to connect your EC2."
}