import React from "react";

export interface EmptyFileSVGProps {
    isDark?: boolean;
}

const EmptyFileSVG: React.FC<EmptyFileSVGProps> = ({ isDark }) => {
    const bgColor = isDark ? "#aecdff" : "#fff";

    return (
        <svg fill="none" height="240" width="240" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M194.648 96.87c1.33-51.9-68.74-73.57-92.58-23.76-7.04-6.77-16.66-10.63-27-9.78-13.81 1.12-25.13 10.28-30.08 22.68-48.53-6.38-60.41 66.96-.1 66.96h.97v14.92h-7.95l15.96 27.63 15.96-27.63h-7.96v-14.92h131V135.3h-7.96l15.96-27.63 15.96 27.63h-7.96v17.67h1.56c36.65 0 35.85-62.72-15.78-56.1Z"
                fill="url(#empty-file-svg)"
                opacity=".25"
            />
            <path d="M164.245 165 180 107H74.248L72 165h92.245Z" fill="#4951EC" />
            <path d="M86.33 86 86 152.982 165.045 160 171 88.786 86.33 86Z" fill={bgColor} />
            <path
                d="M60 97.289 71.979 165H164l-5.981-61.268h-49.392L104.142 96 60 97.289Z"
                fill="#3381FF"
            />
            <path
                d="M58.187 132.203c.218-.322.27-.733.137-1.103a1.216 1.216 0 0 0-.797-.766l-12.944-4.031a1.24 1.24 0 0 0-1.396.49l-8.28 12.363a3.822 3.822 0 0 0-.994-.982 3.828 3.828 0 0 0-5.309 1.048 3.828 3.828 0 0 0 1.048 5.309c1.66 1.113 3.867.737 5.095-.791l.044.033 6.318-9.433 10.481 3.264-3.658 5.46a3.817 3.817 0 0 0-.978-.964 3.827 3.827 0 0 0-5.309 1.048 3.827 3.827 0 0 0 6.357 4.26c.011-.016.017-.035.028-.052l10.157-15.153Zm-5.158 3.257-10.481-3.265 2.183-3.259 10.48 3.271-2.182 3.253Z"
                fill="#4951EC"
            />
            <path
                d="M42.777 120.067a.549.549 0 0 0-.294-.829l-5.72-1.779a.536.536 0 0 0-.613.216l-3.66 5.466a1.794 1.794 0 0 0-.438-.438 1.688 1.688 0 0 0-2.345.463c-.52.774-.312 1.83.464 2.345a1.69 1.69 0 0 0 2.252-.35l.023.013 2.79-4.175 4.635 1.442-1.615 2.413a1.699 1.699 0 0 0-.43-.422 1.688 1.688 0 0 0-2.345.463c-.52.774-.312 1.83.464 2.345.774.521 1.83.312 2.344-.464.002-.006.006-.018.014-.022l4.474-6.687Zm-2.279 1.438-4.634-1.442.963-1.437 4.635 1.442-.964 1.437Z"
                fill="#407BFF"
            />
            <path
                d="m64.06 66.226-29.5 6.064 4.721 22.97 29.501-6.064-4.721-22.97Z"
                fill="#7C9AF2"
            />
            {isDark ? (
                <>
                    <path
                        d="M65.888 74.15c-1.777-1.585-3.179-1.826-4.58.174-2.14 3.055-2.814 9.504-4.534 9.391-1.719-.112-2.231-2.615-4.068-4.087-1.843-1.468-3.622 2.593-7.376 7.512-2.29 3-4.96 4.714-6.696 5.59l.566 2.747 29.812-6.127-3.124-15.2Z"
                        fill="#3381FF"
                    />
                    <path
                        d="M46.26 75.957a3.848 3.848 0 0 1-2.992 4.542 3.848 3.848 0 0 1-4.541-2.992 3.845 3.845 0 0 1 7.532-1.55Z"
                        fill="#fff"
                        style={{ mixBlendMode: "soft-light" }}
                    />
                    <path
                        d="M153.097 50.985a.212.212 0 0 0-.058-.026c-.013-.006-.032-.02-.045-.026-5.846-2.44-12.169.078-14.564 5.538a10.86 10.86 0 0 0-.895 5.19 62.364 62.364 0 0 1-.348 5.845c-.264 2.53-.876 4.926-1.024 5.267-.012.032-.032.065-.045.103a.82.82 0 0 0 .406 1.101l.051.026 4.482 1.97.051.026 1.211.534.051.013 4.481 1.97.052.026a.82.82 0 0 0 1.088-.444c.013-.039.032-.071.045-.103.148-.335 1.5-2.408 3.187-4.32a62.315 62.315 0 0 1 4.069-4.211 10.851 10.851 0 0 0 3.213-4.166c2.395-5.46-.025-11.815-5.408-14.313Z"
                        fill="#5876ac"
                    />
                </>
            ) : (
                <>
                    <path
                        d="M65.888 74.15c-1.777-1.585-3.179-1.826-4.58.174-2.14 3.055-2.814 9.504-4.534 9.391-1.719-.113-2.231-2.615-4.068-4.087-1.843-1.468-3.622 2.593-7.376 7.512-2.29 3-4.96 4.714-6.696 5.59l.566 2.747 29.812-6.127-3.124-15.2Z"
                        fill="#3381FF"
                    />
                    <path
                        d="M46.26 75.957a3.848 3.848 0 0 1-2.992 4.542 3.848 3.848 0 0 1-4.541-2.991 3.845 3.845 0 0 1 7.532-1.55Zm106.837-24.972a.212.212 0 0 0-.058-.026c-.013-.006-.032-.02-.045-.026-5.846-2.44-12.169.078-14.564 5.538a10.86 10.86 0 0 0-.895 5.19 62.364 62.364 0 0 1-.348 5.845c-.264 2.53-.876 4.926-1.024 5.267-.012.032-.032.065-.045.103a.82.82 0 0 0 .406 1.101l.051.026 4.482 1.97.051.026 1.211.534.051.013 4.481 1.97.052.026a.82.82 0 0 0 1.088-.444c.013-.039.032-.071.045-.103.148-.335 1.5-2.408 3.187-4.32a62.315 62.315 0 0 1 4.069-4.211 10.851 10.851 0 0 0 3.213-4.166c2.395-5.46-.025-11.815-5.408-14.313Z"
                        fill="#fff"
                    />
                </>
            )}
            <path
                d="m147.142 78.57-10.8-4.742-1.101 2.505 10.8 4.743 1.101-2.505Zm-2.37 5.394 1.004-2.293-10.797-4.745-.979 2.228 10.772 4.81Z"
                fill="#2867CC"
            />
            <path d="m146.039 81.077-10.8-4.743-.261.595 10.8 4.743.261-.595Z" fill="#fff" />
            <path d="m134 79.154 1.378 3.206 6.059 2.64 3.335-1.037L134 79.153Z" fill="#2867CC" />
            <path
                d="M148.436 73.848c1.004-1.52 2.408-3.27 4.217-4.706 4.127-3.265 6.999-6.445 4.636-12.317m-15.827 17.12s1.236-7.925.386-10.134c-.856-2.208-1.538 4.34 1.649 3.432 3.187-.908 1.539-4.784 1.081-3.026-.457 1.751.734 4.03 2.634 2.936 1.906-1.095 1.989-2.75.869-2.016-1.127.728.225 3.921 2.06 3.168 1.835-.753 1.443-1.809.084-1.217-1.359.593-4.365 6.471-5.267 8.66"
                stroke="#C1D5FF"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
            />
            <path
                d="m212.953 76.918-11.005-1.449-2.535 19.258 11.004 1.448a.682.682 0 0 0 .771-.591l2.353-17.87c.051-.392-.195-.745-.588-.796Z"
                fill="#5B9AFF"
            />
            {isDark ? (
                <path
                    d="m199.547 88.453 9.642 1.27-.18 1.362-9.642-1.27.18-1.362Zm-.363 2.751 9.642 1.27-.182 1.388-9.642-1.269.182-1.389Zm5.768-11.821a4.185 4.185 0 0 0-4.685 3.594 4.185 4.185 0 0 0 3.595 4.685 4.184 4.184 0 0 0 4.685-3.595l-4.14-.545.545-4.14Z"
                    fill="#fff"
                    style={{ mixBlendMode: "soft-light" }}
                />
            ) : (
                <path
                    d="m199.547 88.454 9.642 1.269-.18 1.362-9.642-1.269.18-1.362Zm-.363 2.75 9.642 1.27-.182 1.389-9.642-1.27.182-1.388Zm5.768-11.821a4.185 4.185 0 0 0-4.685 3.595 4.185 4.185 0 0 0 3.595 4.684 4.184 4.184 0 0 0 4.685-3.595l-4.14-.544.545-4.14Z"
                    fill="#fff"
                />
            )}
            <path
                d="m206.497 78.174-.545 4.14 4.14.544a4.184 4.184 0 0 0-3.595-4.684Z"
                fill="#fff"
                style={isDark ? { mixBlendMode: "soft-light" } : undefined}
            />
            <path
                d="m200.436 97.687-14.074-4.652 2.539-19.284 14.798-.85-3.263 24.786Z"
                fill="#3381FF"
            />
            {isDark ? (
                <path
                    d="m195.693 79.656-3.249-.427-1.241 9.432 2.017.266.428-3.25 1.048.139c1.126.148 2.055-.023 2.79-.54.73-.49 1.175-1.23 1.299-2.174.262-1.991-.786-3.142-3.092-3.446Zm-.967 4.511-.864-.114.386-2.934.865.114c1.1.144 1.588.689 1.461 1.658-.135 1.022-.747 1.421-1.848 1.276Z"
                    fill="#fff"
                    style={{ mixBlendMode: "soft-light" }}
                />
            ) : (
                <path
                    d="m195.693 79.657-3.249-.428-1.241 9.432 2.017.266.428-3.25 1.048.139c1.126.148 2.055-.023 2.79-.54.73-.49 1.175-1.23 1.299-2.174.262-1.991-.786-3.142-3.092-3.445Zm-.967 4.51-.864-.114.386-2.934.865.114c1.1.145 1.588.689 1.461 1.658-.135 1.022-.747 1.421-1.848 1.276Z"
                    fill="#fff"
                />
            )}
            <defs>
                <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="empty-file-svg"
                    x1="119.968"
                    x2="119.968"
                    y1="45"
                    y2="195.52"
                >
                    <stop stopColor="#69A0FF" />
                    <stop offset="1" stopColor="#D6E5FF" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default EmptyFileSVG;
