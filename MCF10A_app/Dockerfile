FROM debian:stable

RUN apt-get update
RUN apt-get -y install vim
RUN apt-get -y install python python-dev python-pip python-setuptools
RUN apt-get -y install nginx uwsgi-core

RUN pip install -Iv Flask flask-cors requests uwsgi

EXPOSE 80

ADD . /mcf10a
RUN chmod -R 777 /mcf10a/boot.sh
CMD /mcf10a/boot.sh
