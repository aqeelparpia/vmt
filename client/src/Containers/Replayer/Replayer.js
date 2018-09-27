import React, { Component } from 'react';
import WorkspaceLayout from '../../Layout/Room/Workspace/Workspace';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import DesmosReplayer from './DesmosReplayer';
import GgbReplayer from './GgbReplayer';
import ChatReplayer from './ChatReplayer';
import ReplayControls from '../../Components/Replayer/Replayer';
import moment from 'moment';
const MAX_WAIT = 10000; // 10 seconds
const BREAK_DURATION = 2000;
const PLAYBACK_SPEED = 100;
class Replayer extends Component {

  state = {
    playing: false,
    logIndex: 0,
    timeElapsed: 0, // MS
    currentMembers: [],
    startTime: '',
  }

  log = this.props.room.events
    .concat(this.props.room.chat)
    .sort((a, b) => a.timestamp - b.timestamp);
  endTime = moment
    .unix(this.log[this.log.length - 1].timestamp / 1000)
    .format('MM/DD/YYYY h:mm:ss A');
  blocks = [];
  blockStart = {
    unix: this.log[0].timestamp,
    time: moment.unix(this.log[0].timestamp / 1000).format('MM/DD/YYYY h:mm:ss A'),
    logIndex: 0
  };

  updatedLog = []

  // displayDuration = this.log.
  relativeDuration = this.log.reduce((acc, cur, idx, src) => {
    // Copy currentEvent
    let event = {...cur};
    // Add the relative Time
    event.relTime = acc;
    this.updatedLog.push(event)
    // calculate the next time
    if (src[idx + 1]) {
      let diff = src[idx + 1].timestamp - cur.timestamp
      console.log("DIFF: ", diff)
      if ( diff < MAX_WAIT) {
        return acc += diff;
      } else {
        this.updatedLog.push({
          synthetic: true,
          message: `No activity...skipping ahead to ${moment.unix(src[idx + 1].timestamp/1000).format('MM/DD/YYYY h:mm:ss A')}`,
          relTime: acc += BREAK_DURATION,
        })
        return acc += BREAK_DURATION;
      }
    } else return acc;
  }, 0)

  // displayDuration = this.log.reduce((acc, cur, idx, src) => {
  //   this.updatedLog.push(cur)
  //   if (src[idx + 1]){
  //     let diff = src[idx + 1].timestamp - cur.timestamp
  //     if (diff < MAX_WAIT) {
  //       acc += diff;
  //     } else {
  //       this.updatedLog.push({
  //         synthetic: true,
  //         message: `No activity...skipping ahead to ${moment.unix(src[idx + 1].timestamp/1000).format('MM/DD/YYYY h:mm:ss A')}`
  //       })
  //       acc += 2000; // ADD 2 seconds for synthetic events
  //       // THIS INFO WAS HELPFUL FOR DEBUGGIN BUT I THINK WE JUST NEED DURATION
  //       let newBlock = {
  //         // startTime: this.blockStart.time,
  //         // endTime: moment.unix(cur.timestamp /1000).format('MM/DD/YYYY h:mm:ss A'),
  //         duration: cur.timestamp  - this.blockStart.unix,
  //         // startIndex: this.blockStart.logIndex,
  //         // endIndex: idx,
  //       }
  //       this.blocks.push(newBlock)
  //       this.blockStart = {
  //         unix: src[idx + 1].timestamp,
  //         time: moment.unix(src[idx + 1].timestamp / 1000).format('MM/DD/YYYY h:mm:ss A'),
  //         logIndex: idx + 1}
  //     }
  //   } else {
  //     let newBlock = {
  //       // startTime: this.blockStart.time,
  //       // endTime: moment.unix(cur.timestamp /1000).format('MM/DD/YYYY h:mm:ss A'),
  //       duration: cur.timestamp  - this.blockStart.unix,
  //       // startIndex: this.blockStart.logIndex,
  //       // endIndex: idx,
  //     }
  //     this.blocks.push(newBlock)
  //   }
  //   return acc;
  // }, 0);

  componentDidMount() {

    console.log("UPDATED: LOG: ", this.updatedLog)
    const updatedMembers = [...this.state.currentMembers];
    if (this.log[0].autogenerated) {
      // DONT NEED TO CHECK IF THEYRE ENTERING OR EXITING, BECAUSE ITS THE FIRST EVENT THEY MUST
      // BE ENTERING
      updatedMembers.push(this.log[0].user);
    }
    this.setState({
      startTime: moment
        .unix(this.log[0].timestamp / 1000)
        .format('MM/DD/YYYY h:mm:ss A'),
      currentMembers: updatedMembers
    })
  }


  componentDidUpdate(prevProps, prevState){
    if (!prevState.playing && this.state.playing && this.state.logIndex < this.log.length) {
      this.playing();
    }
  }

  playing = () => {
    console.log("setting interval")
    this.interval = setInterval(() => {
      let timeElapsed = this.state.timeElapsed;
      let logIndex = this.state.logIndex;
      timeElapsed += PLAYBACK_SPEED
      console.log("time elapsed: ", timeElapsed)
      console.log('Next event @: ', this.updatedLog[this.state.logIndex + 1].relTime)
      if (timeElapsed >= this.updatedLog[this.state.logIndex + 1].relTime) {
        console.log('time elapsed is greated that next event')
        logIndex++
      }
      this.setState(prevState => ({logIndex, timeElapsed,}))
    }, PLAYBACK_SPEED)


    // let eventDuration;
    // const nextEvent = this.updatedLog[this.state.logIndex + 1];
    // let updatedStartTime = this.state.startTime;
    // if (nextEvent.synthetic) {
    //   eventDuration = BREAK_DURATION;
    // } else if (this.updatedLog[this.state.logIndex].synthetic) {
    //   eventDuration = BREAK_DURATION;
    //   updatedStartTime = moment
    //   .unix(nextEvent.timestamp / 1000)
    //   .format('MM/DD/YYYY h:mm:ss A');
    // }
    // else {eventDuration = nextEvent.timestamp - this.updatedLog[this.state.logIndex].timestamp};
    // let updatedMembers = [...this.state.currentMembers]
    // if (nextEvent.autogenerated) {
    //   if (nextEvent.text.includes('joined')) {
    //     updatedMembers.push(nextEvent.user)
    //   }
    //   else {updatedMembers = updatedMembers.filter(user => user._id !== nextEvent.user._id)}
    // }
    // setTimeout(() => {
    //   this.setState(prevState => ({
    //     logIndex: prevState.logIndex + 1,
    //     currentMembers: updatedMembers,
    //     startTime: updatedStartTime,
    //   })
    // )}, eventDuration)
  }

  pausePlay = () => {
    if (this.state.playing) {
      console.log('clearing interval')
      clearInterval(this.interval)
    }
    this.setState(prevState => ({
      playing: !prevState.playing
    }))
  }

  goToIndex = (index) => {
    console.log(index)
  }

  render() {
    const { room } = this.props
    const event = this.log[this.state.logIndex] || {};
    return (
      <WorkspaceLayout
        activeMember = {event.user}
        members = {this.state.currentMembers}
        graph = {room.roomType === 'geogebra' ?
          // I dont like that these 👇 need to be wrapped in functions could do
          // props.children but I like naming them. Wait is this dumb? we could just pass
          // event to workspaceLayout and then import the graphs there...I did kind of like
          // that a container is importing the containers....I dunno
          () => <GgbReplayer event={event} /> :
          () => <DesmosReplayer event={event} />}
        chat = {() => <ChatReplayer event={event} />}
        // chat={() => <div>chat</div>}
        replayer={() =>
          (<ReplayControls
            playing={this.state.playing}
            pausePlay={this.pausePlay}
            displayDuration={this.relativeDuration}
            blocks={this.blocks}
            startTime={this.state.startTime}
            goToIndex={(index) => this.goToIndex(index)}
            // event={event}
            relTime={this.state.timeElapsed}
            index={this.state.logIndex}
            log={this.updatedLog}
            endTime={this.endTime}
           />)
        }
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    room: state.rooms.byId[ownProps.match.params.room_id],
    user: state.user,
    loading: state.loading.loading,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateRoom: (roomId, body) => dispatch(actions.updateRoom(roomId, body)),
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(Replayer);
