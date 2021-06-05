Examples can be run in a couple of ways.  
The import of @eirikb/domdom is a bit problematic, but I wanted the examples to be very "real world"-like.

#### Option A) Copy examples out of project

```bash
git clone https://github.com/eirikb/domdom
cp -r domdom/examples .
cd examples/hello-world
npm i @eirikb/domdom
npx parcel index.html
```

#### Option B) Build domdom and reference parent

```bash
git clone https://github.com/eirikb/domdom
cd domdom
npm i
npm run build
cd examples/hello-world
sed -i 's/import.*/import domdom from "..\/.."/' app.tsx
npx parcel index.html
```

