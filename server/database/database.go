package database

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type (
	Configuration struct {
		DSN string
	}
)

func Connect(configuration *Configuration) (pool *pgxpool.Pool, err error) {
	c, err := pgxpool.ParseConfig(configuration.DSN)
	if err != nil {
		return
	}

	c.MaxConnLifetime = time.Second * 4
	c.MaxConnIdleTime = time.Second * 32
	c.MinConns = 8

	pool, err = pgxpool.NewWithConfig(context.Background(), c)
	return
}