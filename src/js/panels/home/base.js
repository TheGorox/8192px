import React from 'react';
import {connect} from 'react-redux';

import {closePopout, goBack, openModal, openPopout, setPage} from '../../store/router/actions';

import {Div, Panel, Alert, Group, Button, PanelHeader} from "@vkontakte/vkui"

class HomePanelBase extends React.Component {

    state = {
        showImg: false
    };

    showImg = () => {
        this.setState({showImg: true});
    };

    openPopout() {
        this.props.openPopout(
            <Alert
                actions={[{
                    title: 'Нет',
                    autoclose: true,
                    style: 'cancel',
                }, {
                    title: 'Да',
                    autoclose: true,
                    action: this.showImg
                }]}
                onClose={() => this.props.closePopout()}
            >
                <h2>Вопрос значит</h2>
                <p>Вас роняли в детстве?</p>
            </Alert>
        );
    }

    render() {
        const {id, setPage, withoutEpic} = this.props;

        return (
            <Panel id={id}>
                <PanelHeader>Ты няшка</PanelHeader>
                {this.props.children}
            </Panel>
        );
    }

}

const mapDispatchToProps = {
    setPage,
    goBack,
    openPopout,
    closePopout,
    openModal
};

export default connect(null, mapDispatchToProps)(HomePanelBase);