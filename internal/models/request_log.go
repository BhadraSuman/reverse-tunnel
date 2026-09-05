package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RequestLog captures full details of a single HTTP request/response pair passing through a tunnel.
type RequestLog struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ChannelID       string             `bson:"channelId" json:"channelId"`
	Subdomain       string             `bson:"subdomain" json:"subdomain"`
	UserID          string             `bson:"userId,omitempty" json:"userId,omitempty"`
	Method          string             `bson:"method" json:"method"`
	Path            string             `bson:"path" json:"path"`
	Query           string             `bson:"query,omitempty" json:"query,omitempty"`
	RequestHeaders  map[string]string  `bson:"requestHeaders" json:"requestHeaders"`
	RequestBody     string             `bson:"requestBody,omitempty" json:"requestBody,omitempty"`     // Base64 encoded or text
	ResponseStatus  int                `bson:"responseStatus" json:"responseStatus"`
	ResponseHeaders map[string]string  `bson:"responseHeaders,omitempty" json:"responseHeaders,omitempty"`
	ResponseBody    string             `bson:"responseBody,omitempty" json:"responseBody,omitempty"`   // Base64 encoded or text
	DurationMs      int64              `bson:"durationMs" json:"durationMs"`
	ClientIP        string             `bson:"clientIp,omitempty" json:"clientIp,omitempty"`
	CreatedAt       time.Time          `bson:"createdAt" json:"createdAt"`
	ExpiresAt       time.Time          `bson:"expiresAt" json:"expiresAt"` // Used for 24h MongoDB TTL auto-deletion
}
