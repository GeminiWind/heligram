terraform {
  backend "s3" {}
}

provider "aws" {
  region = "${var.aws_region}"
}

data "aws_ami" "xenial_16-04" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "tls_private_key" "privkey" {
    algorithm = "RSA"
    rsa_bits = 4096
}

resource "aws_security_group" "app_sg" {
  name        = "heligram_security_group"
  description = "Security group configuration for Heligram"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

   ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_key_pair" "public_key" {
  key_name   = "${var.public_key_name}"
  public_key = "${tls_private_key.privkey.public_key_openssh}"
}

resource "aws_instance" "web" {
  instance_type = "t2.micro"
  ami           = "${data.aws_ami.xenial_16-04.id}"

  security_groups = ["${aws_security_group.app_sg.name}"]

  key_name = "${aws_key_pair.public_key.key_name}"

  tags = {
    APP = "Heligram"
    STAGE = "${var.stage}"
  }
}

resource "null_resource" "install_dep" {
  connection {
    host        = "${aws_instance.web.public_dns}"
    type        = "ssh"
    agent       = false
    private_key = "${tls_private_key.privkey.private_key_pem}"
    user        = "ubuntu"
  }

   provisioner "remote-exec" {
    inline = [
      "sudo apt-get update -y",
      "sudo apt-get install git -y",
      "sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common -y",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -",
      "sudo add-apt-repository 'deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable'",
      "sudo apt-get update -y",
      "sudo apt-get install docker-ce -y",
      "sudo systemctl start docker",
      "docker version",
      "sudo curl -L https://github.com/docker/compose/releases/download/1.24.0/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose",
      "sudo chmod +x /usr/local/bin/docker-compose",
      "sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose",
      "docker-compose version",
      "sudo usermod -a -G docker ubuntu",
    ]
  }

  depends_on = ["aws_instance.web"]
}

resource "null_resource" "pull_code" {
  connection {
    host        = "${aws_instance.web.public_dns}"
    type        = "ssh"
    agent       = false
    private_key = "${tls_private_key.privkey.private_key_pem}"
    user        = "ubuntu"
  }

   provisioner "remote-exec" {
    inline = [
      "rm -rf /tmp/heligram",
      "git clone https://github.com/GeminiWind/heligram /tmp/heligram",
      "cd /tmp/heligram",
      "git checkout ${var.commit_sha}",
      "docker-compose up -d"
    ]
  }

  depends_on = ["null_resource.install_dep"]
}