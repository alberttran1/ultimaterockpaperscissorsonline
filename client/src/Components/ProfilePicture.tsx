import React from 'react'
import type { MatchPlayer } from '../Context/GameInfoContext'

interface ProfilePictureProps {
    player : MatchPlayer // should change to a user
}

const ProfilePicture : React.FC<ProfilePictureProps> = ({player}) => {

    if(!player.photoURL) {
        return (
            <div className='h-14 w-14 flex text-center justify-center items-center rounded-full bg-purple-800 text-white text-2xl'>
                {player.username ? player.username[0].toUpperCase() : ""}
            </div>
        )
    }

    return (
        <img
        src={player.photoURL}
        className="h-14 rounded-full"
        />
    )
}

export default ProfilePicture