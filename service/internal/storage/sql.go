package storage

import (
	"github.com/qbaware/kosher/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// SQLStorage represents an SQL storage for browsers and users.
type SQLStorage struct {
	db *gorm.DB
}

var _ BrowserStorage = &SQLStorage{}
var _ UserStorage = &SQLStorage{}

// NewSQLStorage creates an in-memory browsers storage.
func NewSQLStorage() *SQLStorage {
	storage := &SQLStorage{}
	err := storage.StartConnection()
	if err != nil {
		panic(err)
	}

	return storage
}

// StartConnection starts a connection to the database.
func (ss *SQLStorage) StartConnection() error {
	// TODO: Move this to config
	connStr := "postgres://postgres.qsnrjzssuazkafzlxczg:EVyKuRxEJXXdgfGd@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"
	db, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		return err
	}

	// Migrate the schema
	db.AutoMigrate(&models.Browser{})
	db.AutoMigrate(&models.User{})

	ss.db = db

	return nil
}

// UpsertTab adds or updates a browser in storage.
func (ss *SQLStorage) UpsertBrowser(userID string, browser models.Browser) error {
	browser.UserID = userID

	result := ss.db.Save(&browser)

	return result.Error
}

// ListTabs retrieves all browsers.
func (ss *SQLStorage) ListBrowsers(userID string) ([]models.Browser, error) {
	browsers := []models.Browser{}
	result := ss.db.Where("user_id = ?", userID).Find(&browsers)

	return browsers, result.Error
}

// ExistsBrowser checks if a browser exists in storage.
func (ss *SQLStorage) ExistsBrowser(userID string, browserID string) (bool, error) {
	var count int64
	result := ss.db.Model(&models.Browser{}).Where("user_id = ? AND id = ?", userID, browserID).Count(&count)

	return count > 0, result.Error
}

// CountBrowsers counts all browsers from storage.
func (ss *SQLStorage) CountBrowsers(userID string) (int, error) {
	var count int64
	result := ss.db.Model(&models.Browser{}).Where("user_id = ?", userID).Count(&count)

	return int(count), result.Error
}

// RemoveTab removes a browser from the storage.
func (ss *SQLStorage) RemoveBrowsers(userID string, ids []string) error {
	result := ss.db.Delete(&models.Browser{}, "user_id = ? AND id IN ?", userID, ids)

	return result.Error
}

// GetUser retrieves a user.
func (ss *SQLStorage) GetUser(userID string) (models.User, error) {
	user := models.User{}
	result := ss.db.Where("id = ?", userID).Find(&user)

	if !user.IsValid() {
		return models.User{}, gorm.ErrRecordNotFound
	}
	return user, result.Error
}

// GetUserByEmail retrieves a user.
func (ss *SQLStorage) GetUserByEmail(userEmail string) (models.User, error) {
	user := models.User{}
	result := ss.db.Where("email = ?", userEmail).Find(&user)

	if !user.IsValid() {
		return models.User{}, gorm.ErrRecordNotFound
	}
	return user, result.Error
}

// UpsertUser stores the user.
func (ss *SQLStorage) UpsertUser(user models.User) error {
	result := ss.db.Save(&user)
	return result.Error
}

// UpsertSubscription updates a user's subscription.
func (ss *SQLStorage) UpsertSubscription(userID string, subscription string) error {
	result := ss.db.Model(&models.User{}).Where("id = ?", userID).Update("subscription", subscription)
	return result.Error
}
