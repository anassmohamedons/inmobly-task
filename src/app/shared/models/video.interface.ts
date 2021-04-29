// Interface used in the YouTube API video route
export interface VideoResponse {
    items: Video[],
    nextPageToken: string
    prevPageToken: string
}

// Interface used to layout the structure for the video response items
export interface Video {
    videoId: string
    snippet: {
        title: string
        description: string
        publishedAt: string
        thumbnails: {
            medium: {
                url: string
            },
            maxres: {
                url: string
            }
        },
        resourceId: {
            videoId: string
        }
    }
    contentDetails: {
        duration: string
    }
    statistics: {
        viewCount: string,
        likeCount: string
    }
}