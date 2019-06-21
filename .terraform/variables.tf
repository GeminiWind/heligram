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

variable "aws_amis" {
  default = {
    // FIXME: find out the correct AWS AMI id
    "ap-southeast-2" = "ami-b1cf19c6"
  }
}