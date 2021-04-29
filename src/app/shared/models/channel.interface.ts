// Interface used in the YouTube API channel route
export interface ChannelResponse {
    contentDetails: {
        relatedPlaylists: {
            uploads: string
        }
    }
}
