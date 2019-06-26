variable "aws_region" {
  description = "AWS region to launch servers."
  default     = "ap-southeast-2"
}

variable "aws_access_key" {
  description = "AWS Access key."
}

variable "aws_secret_key" {
  description = "AWS Secret key."
}

variable "public_key_name" {
  description = "SSH Key name to connect your EC2."
}