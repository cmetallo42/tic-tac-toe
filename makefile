NAME = tictactoe
HOST = 89.22.228.160

ENVIRONMENT = CGO_ENABLED="0" GOARCH="amd64" GOOS="linux"

define SERVICE
[Unit]
Description=$(NAME)
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=/root/.$(NAME)-data
ExecStart=/root/.$(NAME)-server/main
[Install]
WantedBy=multi-user.target
endef

export SERVICE

define INSTALL
rm -r /root/.$(NAME)-data
rm -r /root/.$(NAME)-server

mkdir /root/.$(NAME)-data
mkdir /root/.$(NAME)-data/fileserver

mv /root/.$(NAME)-update/server /root/.$(NAME)-server

mv /root/.$(NAME)-update/ui /root/.$(NAME)-data/fileserver/ui

mv /root/.$(NAME)-update/$(NAME).service /etc/systemd/system/$(NAME).service

mv -f /root/.$(NAME)-update/.env /root/.$(NAME)-data/.env

rm -r /root/.$(NAME)-update

systemctl enable $(NAME)
systemctl restart $(NAME)

exit
endef

export INSTALL

define UPDATE
rm -r /root/.$(NAME)-server
rm -r /root/.$(NAME)-data/fileserver/ui

mv /root/.$(NAME)-update/server /root/.$(NAME)-server

mv /root/.$(NAME)-update/ui /root/.$(NAME)-data/fileserver/ui

mv -f /root/.$(NAME)-update/.env /root/.$(NAME)-data/.env

rm -r /root/.$(NAME)-update

systemctl enable $(NAME)
systemctl restart $(NAME)

exit
endef

export UPDATE

.PHONY: server ui service env upload clean install update

.ONESHELL:

server:
	cd server && go generate && $(ENVIRONMENT) go build -ldflags='-s -w' -trimpath -o ../update/server/main

ui:
	cd ui && pnpm run build --directory ../update/ui

service:
	echo "$$SERVICE" > update/$(NAME).service

env:
	cp .env update/.env

upload:
	scp -pr update root@$(HOST):/root/.$(NAME)-update

clean:
	rm -rf update

install:
	ssh root@$(HOST) "$$INSTALL"

update:
	ssh root@$(HOST) "$$UPDATE"

i: server ui service env upload clean install

u: server ui env upload clean update

c: clean