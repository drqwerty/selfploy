import { Categories } from "./categories";
import _ from "lodash";

console.table(Categories);

// const a = {};

const jsonSaved = {
  limpieza: ["alfombras", "muebles"],
  mudanzas: ["mudanzas internacionales"],
  pintura: ["humedades", "pintura", "pintura general"]
};

// Categories.forEach(category => {
//   if (category.checked) {
//     a[category.name] = category.services.map(service => service.name);
//   } else if (category.indeterminateState) {
//     a[category.name] = [];
//     category.services.forEach(service => {
//       if (service.checked) a[category.name].push(service.name);
//     });
//   }
// });

setTimeout(() => {
  _.map(jsonSaved, (srcServices, srcCategory) => {
    const dstCategory = Categories.find(
      category => category.name === srcCategory
    );

    if (srcServices.length === dstCategory.services.length) {
      dstCategory.checked = true;
    } else {
      dstCategory.indeterminateState = true;
    }

    srcServices.map(
      srcServiceName =>
        (dstCategory.services.find(
          dstService => dstService.name === srcServiceName
        ).checked = true)
    );
  });

  console.table(Categories);
}, 100);
