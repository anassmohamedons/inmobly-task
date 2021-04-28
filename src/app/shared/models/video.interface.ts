export interface VideoResponse {
    items: Video[],
    nextPageToken: string
    prevPageToken: string
}

export interface Video {
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