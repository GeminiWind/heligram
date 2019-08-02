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

data "aws_availability_zones" "all" {
  state = "available"
}

resource "tls_private_key" "privkey" {
    algorithm = "RSA"
    rsa_bits = 4096
}

resource "aws_key_pair" "public_key" {
  key_name   = "${var.public_key_name}"
  public_key = "${tls_private_key.privkey.public_key_openssh}"
}

resource "aws_launch_configuration" "launch_configuration" {
  image_id               = "${data.aws_ami.xenial_16-04.id}"
  instance_type          = "t2.micro"
  security_groups        = ["${aws_security_group.app_sg.id}"]
  key_name               = "${var.public_key_name}"
  user_data = <<-EOF
              #!/bin/bash
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
              
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "autosg_gr" {
  launch_configuration = "${aws_launch_configuration.launch_configuration.id}"
  availability_zones = ["ap-southeast-2a", "ap-southeast-2b"]
  min_size = 2
  max_size = 4
  desired_capacity = 2
  load_balancers = ["${aws_elb.elb.name}"]
  health_check_type = "ELB"
  tag {
    key = "Name"
    value = "Heligram"
    propagate_at_launch = true
  }
}

resource "aws_elb" "elb" {
  name = "heligram"

  security_groups = ["${aws_security_group.elb_sg.id}"]

  availability_zones = ["ap-southeast-2a", "ap-southeast-2b"]

  health_check {
    healthy_threshold = 2
    unhealthy_threshold = 2
    timeout = 3
    interval = 30
    target = "HTTP:8080/"
  }

  listener {
    lb_port = 80
    lb_protocol = "http"
    instance_port = "8080"
    instance_protocol = "http"
  }
}