import { useRef, useEffect, useCallback, useState, useContext } from "react";
import { Account, globalStore } from "@netless/flat-stores";
import { RouteNameType } from "../../route-config";
import { joinRoomHandler } from "../../utils/join-room-handler";
import { saveJWTToken } from "../../utils/use-login-check";
import { usePushHistory, useURLParams } from "../../utils/routes";
import { agoraLogin } from "../agoraLogin";
import { githubLogin } from "../githubLogin";
import { googleLogin } from "../googleLogin";
import { WindowsSystemBtnContext } from "../../components/StoreProvider";
import { loginMachine, ToggleEventsType } from "./machine";
import { LoginProcessResult } from "@netless/flat-server-api";
import { LoginButtonProviderType } from "flat-components";
import { LoginDisposer } from "./disposer";
import { NODE_ENV } from "../../constants/process";

export function useMachine(): [any, (type: ToggleEventsType) => void] {
    const { initialState } = loginMachine;
    const [currentState, setCurrentState_] = useState(initialState);

    const setCurrentState = useCallback(
        (type: ToggleEventsType) => {
            if (currentState.can(type)) {
                setCurrentState_(loginMachine.transition(currentState, { type }));
            } else {
                if (NODE_ENV === "development") {
                    console.log(
                        `[ERROR]: current state is ${currentState.value}, but next state ${type} is not reachable`,
                    );
                }
            }
        },
        [currentState],
    );

    return [currentState, setCurrentState];
}

const isJavaScriptProtocol =
    /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;

function sanitizeURL(url: string | null): string | null {
    if (url && isJavaScriptProtocol.test(url)) {
        console.warn("Refuse to redirect to", url);
        return null;
    }
    return url;
}

export interface LoginState {
    currentState: any;
    setCurrentState: (type: ToggleEventsType) => void;
    handleLogin: (loginChannel: LoginButtonProviderType) => void;
    onLoginResult: (authData: LoginProcessResult | null, account?: Account) => void;
    onBoundPhone: () => void;
}

export function useLoginState(): LoginState {
    const pushHistory = usePushHistory();

    const urlParams = useURLParams();
    const windowsBtn = useContext(WindowsSystemBtnContext);
    const [roomUUID] = useState(() => sessionStorage.getItem("roomUUID"));

    const loginDisposer = useRef<LoginDisposer>();
    const [loginResult, setLoginResult] = useState<LoginProcessResult | null>(null);

    const [redirectURL] = useState(() =>
        sanitizeURL(new URLSearchParams(window.location.search).get("redirect")),
    );

    const [currentState, setCurrentState] = useMachine();

    useEffect(() => {
        // update state to binding phone
        // we can not update state to binding phone here if state have already been binding phone state or rebinding phone state
        if (
            globalStore.needPhoneBinding &&
            (loginResult ? !loginResult.hasPhone : false) &&
            currentState.value !== "bindingPhone" &&
            currentState.value !== "rebindingPhone"
        ) {
            setCurrentState("SWITCH_TO_BINDING_PHONE");
        }
    }, [loginResult, currentState, setCurrentState]);

    useEffect(() => {
        return () => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }
            sessionStorage.clear();
        };
    }, []);

    // login success and then check if need binding phone
    const onLoginResult = useCallback(
        async (authData: LoginProcessResult | null, account?: Account) => {
            globalStore.updateUserInfo(authData);
            globalStore.updatePmi();
            globalStore.updatePmiRoomList();

            if (!authData) {
                setLoginResult(null);
                return;
            }

            if (account) {
                globalStore.updateAccountHistory(account);
            }

            saveJWTToken(authData.token);

            // need binding phone
            if (globalStore.needPhoneBinding && !authData.hasPhone) {
                setLoginResult(authData);
                setCurrentState("SWITCH_TO_BINDING_PHONE");
                return;
            }

            if (redirectURL) {
                window.location.href = redirectURL;
                return;
            }
            if (!roomUUID) {
                pushHistory(RouteNameType.HomePage);
                return;
            }
            if (globalStore.isTurnOffDeviceTest || window.isElectron) {
                await joinRoomHandler(roomUUID, pushHistory);
            } else {
                pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
            }
        },
        [pushHistory, redirectURL, roomUUID, setCurrentState],
    );

    // to login
    const handleLogin = useCallback(
        (loginChannel: LoginButtonProviderType) => {
            // update state to WeChat QRCode
            if (loginChannel === "wechat") {
                setCurrentState("SWITCH_TO_QRCODE");
                return;
            }

            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }
            switch (loginChannel) {
                case "agora": {
                    agoraLogin(onLoginResult);
                    return;
                }
                case "github": {
                    loginDisposer.current = githubLogin(onLoginResult, windowsBtn);
                    return;
                }
                case "google": {
                    loginDisposer.current = googleLogin(onLoginResult, windowsBtn);
                    return;
                }
                default: {
                    return;
                }
            }
        },
        [onLoginResult, windowsBtn, setCurrentState],
    );

    const onBoundPhone = useCallback(() => {
        if (loginResult) {
            onLoginResult({ ...loginResult, hasPhone: true });
        }
    }, [loginResult, onLoginResult]);

    useEffect(() => {
        if (urlParams.utm_source === "agora") {
            handleLogin("agora");
        }
    }, [handleLogin, urlParams.utm_source]);

    return {
        currentState,
        setCurrentState,
        handleLogin,
        onLoginResult,
        onBoundPhone,
    };
}
