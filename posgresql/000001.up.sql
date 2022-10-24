create extension pgcrypto;

create table users (
	id uuid not null default gen_random_uuid(),
	name varchar not null,
	email varchar not null default "",
	password varchar not null,

	primary key (id),
);

create table stats (
	id uuid not null,
	wins integer,
	loses integer,
	mmr integer,

	primary key id,
	foreign key (id) references users (id),
);
 