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

data "template_file" "install_dependencies" {
  template = "${file("${path.module}/user-data.tpl")}"

  vars = {
    commit_sha = "${var.commit_sha}"
  }
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

  user_data = "${data.template_file.install_dependencies.rendered}"

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