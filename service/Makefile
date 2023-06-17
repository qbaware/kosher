run:
	cp ./security/postgres/psql-cert.crt ./
	go run cmd/server/main.go
	rm psql-crt.crt

deps:
	go mod download

docker-image-build: deps
	docker build . -t ghcr.io/qbaware/kosher:latest

docker-image-push: docker-image-build
	docker push ghcr.io/qbaware/kosher:latest

deploy-to-heroku:
	cd .. && git subtree push --prefix service heroku main
