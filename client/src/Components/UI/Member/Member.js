import React, { PureComponent } from 'react';
import clickOutside from 'react-click-outside';
import classes from './member.css';
import Avatar from '../Avatar/Avatar';
import Aux from '../../HOC/Auxil';
import PositionedBox from '../Edit/PositionedBox';
import EditMember from './EditMember';
class Member extends PureComponent {

  state = {
    role: this.props.info.role,
    editing: false,
    x: 0,
    y: 0,
  }

  edit = event => {
    this.setState({
      editing: true,
      x: event.pageX,
      y: event.pageY,
    })
  }

  changeRole = (event) => {
    console.log(event.target.name)
    this.setState({role: event.target.name})
  }

  handleClickOutside() {
    if (this.state.editing) {
      setTimeout(() => this.setState({editing: false}), 500)
    }
  }

  render() {
    const { info, owner } = this.props;
    return (
      <Aux>
        {this.state.editing ?
          <PositionedBox x={this.state.x} y={this.state.y}>
            <EditMember role={this.state.role} changeRole={this.changeRole}/>
          </PositionedBox> : null}
        <div className={classes.Container}>
          <div style={{margin: 20}}><Avatar username={info.user.username} /></div>
          <div className={classes.Row}>
            <div className={classes.Role}>{info.role}</div>
            {owner ? <div className={classes.Icon} onClick={this.edit}><i className="fas fa-edit"></i></div> : null}
          </div>
        </div>
      </Aux>
    )
  }
}

export default clickOutside(Member);
