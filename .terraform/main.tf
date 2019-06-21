provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region = "${var.aws_region}"
}

resource "aws_instance" "web" {
  instance_type = "t2.small"
  ami           = "${lookup(var.aws_amis, var.aws_region)}"

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get -y update",
    ]
  }

   tags = {
    app = "Heligram"
  }
}