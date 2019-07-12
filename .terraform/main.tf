terraform {
  backend "s3" {}
}

provider "aws" {
  region = "${var.aws_region}"
}

data "aws_ami" "based_ubuntu_ami" {
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

resource "aws_security_group" "security_group" {
  name        = "heligram_security_group"
  description = "Security group configuration for app"

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
  ami           = "${data.aws_ami.based_ubuntu_ami.id}"

  security_groups = ["${aws_security_group.security_group.name}"]

  key_name = "${aws_key_pair.public_key.key_name}"

  tags = {
    app = "Heligram"
    stage = "${var.stage}"
  }
}

resource "null_resource" "install_dependencies" {
  connection {
    host        = "${aws_instance.web.public_dns}"
    type        = "ssh"
    agent       = false
    private_key = "${tls_private_key.privkey.private_key_pem}"
    user        = "ubuntu"
  }
  provisioner "remote-exec" {
    inline = [
      "sleep 20",
      "sudo apt-get -y update",
      "sudo apt-get -y install apt-transport-https ca-certificates curl gnupg-agent software-properties-common",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -",
      "sudo apt-key fingerprint 0EBFCD88",
      "sudo apt-get -y update",
      "sudo apt-get install docker-ce docker-ce-cli containerd.io",
      "sudo curl -L 'https://github.com/docker/compose/releases/download/1.23.1/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose",
      "sudo chmod +x /usr/local/bin/docker-compose",
    ]
  }
  depends_on = ["aws_instance.web"]
}

resource "null_resource" "pull_code_base" {
  connection {
    host        = "${aws_instance.web.public_dns}"
    type        = "ssh"
    agent       = false
    private_key = "${tls_private_key.privkey.private_key_pem}"
    user        = "ubuntu"
  }

  provisioner "file" {
    source      = "../"
    destination = "/app"
  }

  depends_on = ["null_resource.install_dependencies"]
}

resource "null_resource" "execute_app" {
  connection {
    host        = "${aws_instance.web.public_dns}"
    type        = "ssh"
    agent       = false
    private_key = "${tls_private_key.privkey.private_key_pem}"
    user        = "ubuntu"
  }
  provisioner "remote-exec" {
    inline = [
      "cd /app",
      "docker-compose up"
    ]
  }
  depends_on = ["null_resource.pull_code_base"]
}
