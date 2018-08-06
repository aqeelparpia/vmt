import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import Aux from '../../../Components/HOC/Auxil';
import * as actions from '../../../store/actions';
import WorkspaceLayout from '../../../Layout/Room/Workspace/Workspace';
import Modal from '../../../Components/UI/Modal/Modal';
import Graph from '../Graph/Graph';
import Chat from '../Chat/Chat';
class Workspace extends Component {

  state = {
    loading: true,
    currentUsers: [],
    currentRoom: {}
  }
  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  static getDerivedStateFromProps(nextProps, prevState) {
    // if (nextProps.match.params.room_id !== prevState.currentRoom._id) {
    //
    // }
    if (Object.keys(nextProps.room).length > 0) {
      console.log(nextProps.room)
      return {loading: false}
    } else return null;
  }

  componentDidMount() {
    this.joinRoom();
    // setup socket listeners for users entering and leaving room
    if (Object.keys(this.props.room).length === 0) {
      console.log('requesting current room again')
      this.props.getCurrentRoom(this.props.match.params.room_id)
    }
    this.socket.on('NEW_USER', currentUsers => {
      const updatedRoom = {...this.props.room}
      updatedRoom.currentUsers = currentUsers;
      this.setState({
        room: updatedRoom,
      })
    })

    this.socket.on('USER_LEFT', currentUsers => {
      const updatedRoom = {...this.state.room}
      updatedRoom.currentUsers = currentUsers;
      this.setState({
        room: updatedRoom,
      })
    })
  }

  componentWillUnmount () {
    // @TODO close socket connection
    this.leaveRoom()
  }

  joinRoom = () => {
    const data = {
      roomId: this.props.room._id,
      user: {_id: this.props.userId, username: this.props.username}
    }
    console.log(data)
    this.socket.emit('JOIN', data, () => {
      // check for duplicated ...sometimes is a user is left in if they dont disconnect properly
    //   const duplicate = this.props.room.currentUsers.find(user => user._id === this.props.userId)
    //   const updatedUsers = duplicate ? [...this.props.room.currentUsers] :
    //     [...this.props.room.currentUsers, {username: this.props.username, _id: this.props.userId}];
    //   this.setState(prevState => ({
    //     room: {
    //       ...prevState.room,
    //       currentUsers: updatedUsers
    //     },
    //     replayMode: false,
    //     replaying: false,
    //   }))
    })
  }


  leaveRoom = () => {
    this.socket.emit('LEAVE_ROOM', {roomId: this.props.room._id, userId: this.props.userId})
    // remove this client from the state of current Users
  //   const updatedUsers = this.props.room.currentUsers.filter(user => user._id !== this.props.userId)
  //   this.setState({
  //     room: {
  //       ...this.state.room,
  //       currentUsers: updatedUsers,
  //     }
  //   })
  //   if (this.state.replaying) {
  //     clearInterval(this.player)
  //   }
  }


  render() {
    console.log(this.socket)
    console.log(this.props.room.currentUsers)
    let workspace = null;
    if (!this.state.loading) {
      const graph = <Graph room={this.props.room} replay={false} socket={this.socket} />;
      const chat = <Chat messages={this.props.room.chat} username={this.props.username} userId={this.props.userId} replaying={false} socket={this.socket}/>
      workspace = <WorkspaceLayout graph={graph} chat ={chat} userList={this.props.room.currentUsers} />
    }
    return (
      this.state.loading ?
        <Modal show={this.state.loading} message='Loading...'/> : workspace
    );
  }

}

const mapStateToProps = state => {
  return {
    room: state.roomsReducer.currentRoom,
    userId: state.userReducer.userId,
    username: state.userReducer.username,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCurrentRoom: id => dispatch(actions.getCurrentRoom(id)),
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
