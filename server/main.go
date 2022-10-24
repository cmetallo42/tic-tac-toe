package main

import (
	"crypto/tls"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/cmetallo42/tic-tac-toe/server/database"
	"github.com/cmetallo42/tic-tac-toe/server/server"

	"github.com/valyala/fasthttp"

	"github.com/fasthttp/router"
	"github.com/sakirsensoy/genv"
	"github.com/sakirsensoy/genv/dotenv"

	aheaders "github.com/go-asphyxia/http/headers"
	amethods "github.com/go-asphyxia/http/methods"
	cmiddlewares "github.com/go-asphyxia/middlewares/CORS"
	hmiddlewares "github.com/go-asphyxia/middlewares/HSTS"
	atls "github.com/go-asphyxia/tls"
)

type (
	Configuration struct {
		Host string

		Database database.Configuration
	}
)

var envfile string = ".env"

func main() {
	if len(os.Args) > 1 {
		envfile = os.Args[1]
	}

	dotenv.Load(envfile)

	c := Configuration{
		Host: genv.Key("HOST").String(),
		Database: database.Configuration{
			DSN: genv.Key("DATABASE_DSN").String(),
		},
	}

	err := Main(&c)
	if err != nil {
		panic(err)
	}
}

func Main(configuration *Configuration) (err error) {
	pool, err := database.Connect(&configuration.Database)
	if err != nil {
		return
	}
	defer pool.Close()

	HSTS := hmiddlewares.NewHSTS(31536000)
	CORS := cmiddlewares.NewCORS(
		[]string{configuration.Host},
		[]string{amethods.GET, amethods.POST, amethods.PUT, amethods.DELETE, amethods.OPTIONS},
		[]string{aheaders.ContentType, aheaders.Accept, aheaders.Authorization})

	router := router.New()

	router.ANY("/fileserver/{path:*}", fasthttp.FSHandler("", 0))

	t, err := atls.NewTLS(atls.Version12)
	if err != nil {
		return
	}

	tlsConfiguration, err := t.Auto(atls.DefaultCertificatesCachePath, configuration.Host, ("www." + configuration.Host))
	if err != nil {
		return
	}

	http, err := net.Listen("tcp", ":80")
	if err != nil {
		return
	}

	https, err := net.Listen("tcp", ":443")
	if err != nil {
		return
	}

	https = tls.NewListener(https, tlsConfiguration)

	s := server.Configure(HSTS.Middleware(CORS.Middleware(router.Handler)), configuration.Host)
	defer s.Shutdown()

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)

	errs := make(chan error)

	go func() {
		errs <- s.Serve(http)
	}()

	go func() {
		errs <- s.Serve(https)
	}()

	select {
	case err = <-errs:
	case <-signals:
	}

	return
}
