package models

// User represents a user object.
type User struct {
	ID            string `json:"id" gorm:"primaryKey"`
	Name          string `json:"name"`
	Email         string `json:"email" gorm:"unique"`
	ProfilePicURL string `json:"profile_pic_url"`
	Subscription  string `json:"subscription"`
}

// IsValid returns true if the user is valid.
func (u User) IsValid() bool {
	return u.ID != "" &&
		u.Name != "" &&
		u.Email != "" &&
		u.ProfilePicURL != "" &&
		u.Subscription != ""
}
