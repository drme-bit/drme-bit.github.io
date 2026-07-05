import './LoadingScreen.scss';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-screen__box" />
      <p className="loading-screen__text">
        loading<span className="loading-screen__dots" />
      </p>
    </div>
  );
}
