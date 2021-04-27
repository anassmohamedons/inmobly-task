export interface VideoResponse {
    items: Video[],
    nextPageToken: string
    prevPageToken: string
}

export interface Video extends VideoSnippet {
    id: string
    snippet: VideoSnippet
}

export interface VideoSnippet {
    title: string
    description: string
    publishedAt: string
    thumbnails: {
        medium: {
            url: string
        }
    }
}