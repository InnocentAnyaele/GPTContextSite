import LogoImg from "../../img/logo.png";

export default function Logo() {
  return (
    <div className="flex flex-row space-x-2">
      <img className="w-6 h-6" src={LogoImg} alt="Logo" />
      <span className="font-bold">GPTContext</span>
    </div>
  );
}
