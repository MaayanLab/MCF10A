FROM debian:stable

RUN apt-get update

RUN apt-get -y install vim

RUN apt-get -y install python
RUN apt-get -y install python-dev
RUN apt-get -y install python-pip
RUN apt-get -y install python-setuptools

RUN apt-get -y install apache2
RUN apt-get -y install apache2-prefork-dev
RUN pip install mod_wsgi

RUN pip install -Iv Flask==0.10.1

RUN mkdir -p /home/myuser/.ssh
RUN chown -R myuser:myuser /home/myuser/.ssh
ADD ./files/known_hosts /home/myuser/.ssh/known_hosts
ADD ./files/id_rsa /home/myuser/.ssh/id_rsa
RUN chmod 0600 /home/myuser/.ssh/*
RUN chmod 0700 /home/myuser/.ssh

EXPOSE 80

ADD . /mcf10a

CMD /mcf10a/boot.sh
