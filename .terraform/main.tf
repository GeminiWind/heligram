terraform {
  backend "s3" {}
}

provider "aws" {
  region = "${var.aws_region}"
}

provider "cloudflare" {
  email = "${var.cloudflare_email}"
  token = "${var.cloudflare_token}"
}

resource "tls_private_key" "privkey" {
    algorithm = "RSA"
    rsa_bits = 4096
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

  user_data = <<EOF
#! /bin/bash
sleep 30
sudo apt-get update -y
sudo apt-get install git -ysudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable
sudo apt-get update -y
sudo apt-get install docker-ce -y
sudo service docker start
sudo usermod -a -G docker ubuntu
sudo curl -L https://github.com/docker/compose/releases/download/1.24.0/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo chown root:docker /usr/local/bin/docker-compose
docker-compose version
rm -rf /tmp/heligram
git clone https://github.com/GeminiWind/heligram /tmp/heligram
cd /tmp/heligram
git checkout ${var.commit_sha}
docker-compose up -d
EOF

  tags = {
    APP = "Heligram"
    STAGE = "${var.stage}"
  }
}

resource "cloudflare_record" "register_dns_record" {
  domain  = "${var.root_domain}"
  name    = "api-heligram"
  value   = "${aws_instance.web.public_dns}"
  type    = "CNAME"
  proxied = true

  depends_on = ["aws_instance.web"]
}