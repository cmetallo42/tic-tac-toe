package server

import (
	"time"

	"github.com/valyala/fasthttp"
)

func Configure(handler fasthttp.RequestHandler, name string) (server *fasthttp.Server) {
	server = &fasthttp.Server{
		Name:    name,
		Handler: handler,

		Concurrency:  1024 * 1,
		ReadTimeout:  4 * time.Second,
		WriteTimeout: 4 * time.Second,
		IdleTimeout:  16 * time.Second,
		TCPKeepalive: true,

		StreamRequestBody: true,
		CloseOnShutdown:   true,
	}

	return
}