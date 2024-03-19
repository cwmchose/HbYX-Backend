import fs from "fs";

// const input = `>tr|A0A2U9ICR9|A0A2U9ICR9_9CREN ABC transporter ATP-binding protein OS=Acidianus brierleyi OX=41673 GN=DFR85_03490 PE=4 SV=1
// FYY
// >tr|A0A2U9IEJ5|A0A2U9IEJ5_9CREN Triphosphoribosyl-dephospho-CoA synthase OS=Acidianus brierleyi OX=41673 GN=DFR85_06900 PE=4 SV=1
// IYK`;

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error("Invalid args, <path> <domain> expected");
}
const [path, domain] = args;

function createJson(path, domain, outpath) {
  if (!path || !domain) return;

  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the input file:", err);
      return;
    }

    const lines = data.split(/>sp|>tr/);
    // const lines = data.split(">");
    const jsonResult = [];

    console.log(lines.length);

    let missed = 0;
    let filtered = 0;

    lines.forEach((line) => {
      const [info, motif] = line.split("\n");

      if (info && motif) {
        // const idRegex = /\|(?<id>[A-Z0-9]+)\|[A-Z0-9]+_[A-Z0-9]+/;
        // const proteinNameRegex = /(?<name>[A-Za-z-0-9,/()_+:'\[\].&`\\#\|=;?@~ ]+)/;
        // const speciesNameRegex = /OS=(?<species>[\[\]A-Za-z-._0-9()/=:' ]+)(?=\sOX=)/;
        // const geneNameRegex = /\sGN=(?<gene>[A-Za-z0-9:_]+)/;
        // const matcher = info.match(new RegExp(`(?:${idRegex})${proteinNameRegex}(?\sOS=) ${speciesNameRegex}(?=\sOX=) OX=[0-9]+ (?:${geneNameRegex})?`));

        const matcher = info.match(
          /(?:\|(?<id>[A-Z0-9]+)\|[A-Z0-9]+_[A-Z0-9]+)(?<name>[A-Za-z-0-9,/()_+:'\[\].&`\\#\|=;?@~> ]+)(?=\sOS=) OS=(?<species>[\[\]A-Za-z-._0-9()/=:' ]+)(?=\sOX=) OX=[0-9]+(?:\sGN=(?<gene>[A-Za-z0-9:_]+))?/
        );
        // console.log(matcher.groups);
        // const matcher = info.match(
        //   /\|([A-Z0-9]+)\|([A-Z0-9]+_[A-Z0-9]+) ([A-Za-z- ]+) OS=([A-Za-z- ]+) OX=/
        // );
        const motifMatcher = motif.match(/([A-Z]+)/);

        if (matcher) {
          const { id, gene, name, species } = matcher.groups;
          // console.log(matcher.groups);

          if (motifMatcher[0].match(/[^GCA][A-Z][A-Z]/)) {
            jsonResult.push({
              id,
              gene,
              name,
              species,
              motif: motifMatcher[0],
              domain,
            });
          } else {
            filtered++;
          }
        }
        if (!matcher) {
          console.log(line);
          missed++;
        }
      }
    });
    console.log("filtered: ", filtered);
    console.log(jsonResult.length);
    // Convert the JSON to a string
    const jsonString = JSON.stringify(jsonResult, null, 2);

    // Write the JSON to a new file (assuming the file name is 'output.json')
    fs.writeFile(domain + "-output.json", jsonString, (err) => {
      if (err) {
        console.error("Error writing the output file:", err);
        return;
      }
      console.log("JSON data has been written to output.json");
    });
  });
}

createJson("Virus_HbYX.txt", "virus");
createJson("Archaea_HbYX.txt", "archaea");
createJson("Eukarya_HbYX.txt", "eukarya");
createJson("Bacteria_HbYX.txt", "bacteria");
