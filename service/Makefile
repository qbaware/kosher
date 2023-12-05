run:
	go run cmd/server/main.go

deps:
	go mod download

docker-image-build: deps
	docker build . -t ghcr.io/qbaware/kosher:latest

docker-image-push: docker-image-build
	docker push ghcr.io/qbaware/kosher:latest
