// Coordinate locali: ogni carattere è una cella. # parete, . pavimento, H timone.
export const layout = [
  '    #####    ',
  '   ##.H.##   ',
  '  ##.....##  ',
  ' ##.......## ',
  ' #.........# ',
  ' #.###.###.# ',
  ' #.........# ',
  ' #.........# ',
  ' #.###.###.# ',
  ' #.........# ',
  ' ##.......## ',
  '  #########  ',
];
export const tileSize = 36;
export const helm = { x: 6.5 * tileSize, y: 1.5 * tileSize };
export function walkable(col: number, row: number): boolean {
  return '.H'.includes(layout[row]?.[col] ?? ' ');
}
