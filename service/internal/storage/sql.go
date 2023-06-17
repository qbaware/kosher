package storage

import (
	"fmt"

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
	// TODO: Move to config
	connStr := fmt.Sprint(
		" host=db.qsnrjzssuazkafzlxczg.supabase.co",
		" port=5432",
		" user=postgres",
		" password=EVyKuRxEJXXdgfGd",
		" dbname=postgres",
		" sslmode=verify-full",
		" sslrootcert=psql-cert.crt",
	)
	db, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		return err
	}

	// Migrate the schema
	db.AutoMigrate(&models.Browser{})
	db.AutoMigrate(&models.User{})
	db.AutoMigrate(&models.Subscription{})

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

// RemoveTab removes a browser from the storage.
func (ss *SQLStorage) RemoveBrowsers(userID string, ids []string) error {
	result := ss.db.Delete(&models.Browser{}, "user_id = ? AND id IN ?", userID, ids)

	return result.Error
}

// GetSubscription retrieves a user's subscription.
func (ss *SQLStorage) GetSubscription(userID string) (string, error) {
	sub := models.Subscription{}
	result := ss.db.Where("user_id = ?", userID).Find(&sub)

	return sub.Plan, result.Error
}

// SetSubscription sets a user's subscription.
func (ss *SQLStorage) SetSubscription(userID string, subscription string) error {
	sub := models.Subscription{
		UserID: userID,
		Plan:   subscription,
	}
	result := ss.db.Save(&sub)

	return result.Error
}
