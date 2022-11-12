FROM golang:1.17

WORKDIR /opt/qbaware

COPY . .

RUN go mod download

RUN go build -o kosher ./cmd/main.go

ENTRYPOINT ["./kosher"]
