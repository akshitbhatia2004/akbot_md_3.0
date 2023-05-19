FROM quay.io/akshitbhatia2004/akbot_md_3.0:latest

RUN git clone https://github.com/akshitbhatia2004/akbot_md_3.0/skl/Raganork
WORKDIR /skl/Raganork
ENV TZ=Asia/Kolkata
RUN yarn install --ignore-engines
CMD ["node", "index.js"]
