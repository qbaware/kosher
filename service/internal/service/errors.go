package service

// MaxBrowsersLimitPerUserError is an error that is returned when a user tries to add more than MaxBrowsersLimitPerUser browsers.
type MaxBrowsersLimitPerUserError struct {
}

// Error returns the error message.
func (e *MaxBrowsersLimitPerUserError) Error() string {
	return "max browsers limit reached"
}

type InvalidSubscriptionValueError struct {
}

func (e *InvalidSubscriptionValueError) Error() string {
	return "invalid subscription value"
}
