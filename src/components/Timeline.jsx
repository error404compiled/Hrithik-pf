import TimelineItem from "./TimelineItem";
import { Card, CardContent } from "./ui/Card";

export default function Timeline({ experience }) {
  return (
    <Card>
      <CardContent className="p-0">
        <ul className="ml-10 border-l">
          {experience.map((exp, id) => (
            <TimelineItem key={id} experience={exp} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
