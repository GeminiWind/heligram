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
git checkout ${commit_sha}
docker-compose up -d