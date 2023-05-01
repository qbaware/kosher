package models

// User represents a user object.
type User struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	ProfilePicURL string `json:"profile_pic_url"`
	IsPremium     bool   `json:"is_premium"`
}
