import React from 'react';
import AllArtworks from './artwork_list';
import UploadArtwork from './uploadArtwork';
import EditArtwork from './editArtwork';


const ArtworksMaster = (props) => {
    const page = props.page;
    const params = props.params;
    return (
        page == "artworkList" ? <AllArtworks />
        : page == "uploadArtwork" ? <UploadArtwork />
        : page == "editArtwork" ? <EditArtwork artworkId={params} />
        : <AllArtworks />
    );
}
export default ArtworksMaster;
