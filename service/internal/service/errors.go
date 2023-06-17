package service

import "gorm.io/gorm"

// MaxBrowsersLimitPerUserError is an error that is returned when a user tries to add more than MaxBrowsersLimitPerUser browsers.
type MaxBrowsersLimitPerUserError struct {
}

// Error returns the error message.
func (e *MaxBrowsersLimitPerUserError) Error() string {
	return "max browsers limit reached"
}

// InvalidSubscriptionValueError is an error that is returned when a user tries to set an invalid subscription value.
type InvalidSubscriptionValueError struct {
}

// Error returns the error message.
func (e *InvalidSubscriptionValueError) Error() string {
	return "invalid subscription value"
}

// RecordNotFoundError is an error that is returned when a record is not found.
var RecordNotFoundError error = gorm.ErrRecordNotFound
