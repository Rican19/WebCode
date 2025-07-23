import Body from "./sections/body";
import { DiseaseDataProvider } from "../../contexts/DiseaseDataContext";

export default function Page() {
  return (
    <DiseaseDataProvider>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Body />
      </div>
    </DiseaseDataProvider>
  );
}
