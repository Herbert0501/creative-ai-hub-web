import Icon from '@ant-design/icons';
import styles from '@/app/components/dialog/dialog-message-action.module.scss';
import {Select} from 'antd'
import BreakIcon from "@/app/static/icons/break.svg";
import {userChatStore} from '@/app/store/chat-store';
import { AIVersion } from '@/app/constants'; 
import {SessionConfig} from "@/types/chat";

function Action(props: {
    icon: JSX.Element;
    onClick?: () => void;
}) {
    return <div className={styles['chat-input-action']} onClick={props.onClick}>
        <div className={styles["icon"]}>
            {props.icon}
        </div>
    </div>
}
export default function DialogMessagesActions(props: {
    config: SessionConfig
}){
    const chatStore = userChatStore();
    const {config} = props
    return <div className={styles['chat-input-actions']}>
        <Action icon={<Icon component={BreakIcon} />} onClick={() => {
            chatStore.updateCurrentSession((session) => {
                if (session.clearContextIndex === session.messages.length) {
                    session.clearContextIndex = undefined;
                } else {
                    session.clearContextIndex = session.messages.length;
                }
            });
        }}></Action>
        <Select
            value={config?.aiVersion??AIVersion.GPT_3_5_TURBO}
            style={{ width: 160 }}
            options={[
                { value: AIVersion.GPT_3_5_TURBO, label: 'gpt-3.5-turbo' },
                { value: AIVersion.GPT_3_5_TURBO_16K, label: 'gpt-3.5-turbo-16k' },
                { value: AIVersion.GPT_4, label: 'gpt-4' },
                { value: AIVersion.GPT_4_32K, label: 'gpt-4-32k' },
            ]}
            onChange={(value) => {
                chatStore.updateCurrentSession((session) => {
                    session.config = {
                        ...session.config,
                        aiVersion: value
                    }
                });
            }}
        />
    </div>
}
