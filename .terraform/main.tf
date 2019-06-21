provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region = "${var.aws_region}"
}

resource "aws_ami" "ami" {
  name                = "Sanple AMI"
  virtualization_type = "hvm"
  root_device_name    = "/dev/xvda"

  ebs_block_device {
    device_name = "/dev/xvda"
  }
}

resource "aws_key_pair" "public_key" {
  key_name   = "${var.public_key_name}"
  public_key = "${var.public_key}"
}

resource "aws_instance" "web" {
  instance_type = "t2.small"
  ami           = "${aws_ami.ami.id}"

  key_name = "${aws_key_pair.public_key.id}"

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get -y update",
    ]
  }

   tags = {
    app = "Heligram"
  }
}